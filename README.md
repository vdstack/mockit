[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking the behaviour](https://martinfowler.com/articles/mocksArentStubs.html) of injected dependencies in Typescript. With its help, patterns like Strategy, or Ports & Adapters, become super easy to unit test. Its API was inspired by Java's Mockito package, but has now diverged. Mockito's knowledge is easily transferable though.

Mockit API can mock any dependency:
- functions: `mockFunction(original)`
- classes: `mockClass(original)`
- Types and interfaces: `mockType<T>(...(keyof T)[])`
- Abstract classes: `mockAbstractClass(original, functionsToMock)`

It provides a semantic API that is easy to use, as well as complete type-safety, which helps a LOT when writing tests, as it provides auto-completion and type-checking alerting you of any invalid test setup.

You can also escape the type-safety thanks to the `unsafe` alternatives provided for every Mockit API.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenReturn(2);
when(mockedFunc).isCalledWith("Victor").thenReturn(42);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
```

You can also verify how the mock was called.

```ts
const mockedFunc = mockFunction(original);
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

You can access more advances features like reading the history of calls.

```ts
const mockedFunc = mockFunction(original);
mockedFunc("hello", "world");

getMockHistory(mockedFunc).getCalls(); // [{ args: ["hello", "world"], date: a Date }]
```

Finally, you can leverage the power of the [Zod](https://github.com/colinhacks/zod) library's schemas to make make assertions on the nature of the parameters passed to your mocks.

```ts
const mockedFunc = mockFunction(original);
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

- [mockFunction](#mockFunction)
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

# mockFunction
You can mock functions, classes, abstract classes, interfaces and types. Functions mocks are the base of the library.
Every other type of mock (class, abstract class, interface, type) is built on top of function mocks.

For example, mocking a class is equivalent to mocking all its public functions.
![image (2)](https://github.com/vdstack/mockit/assets/6061078/41a4da91-00ee-4a6c-a0f5-115386cb760e)

Understanding how to handle function mocks in Mockit will unlock any other type of mock.

`mockFunction(original: Function): Function` will provide a fake version of the original function, that complies with its signature.
Deterring the original function's signature will also deter the mock's signature. This is a good thing: it will help you identify quickly that tests are broken.

```ts
function hello() {
  /**/
}

const mockedFunc = mockFunction(hello);
```

# when
You can control the mock's behaviour using the `when` API. It provides a semantic way to define the mock's behaviour. You get a wide range of behaviour available to you, from returning a value, to throwing an error, to calling the original function.

## Behaviours control
There are three main ways to control the mock's behaviour:
- `when(mockedFunc).isCalled` will setup the default behaviour of the mock.
- `when(mockedFunc).isCalledWith(...args: arg[])` will setup the mock to return a value when called with specific arguments.
- `when(mockedFunc).isCalledWith(...(ZodSchema | arg)[])` will setup the mock to return a value when called with arguments that match the zod schema.

You can also setup the mock to return different values depending on the arguments passed to it.
You can also use a zod schema when you don't know the exact value of parameters (this can happen when your code is generating them midway) but want to control the mock when the arguments match a certain shape (like a date, a uuid or an object shape).

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenReturn(2);
when(mockedFunc).isCalledWith("Victor").thenReturn(42);
when(mockedFunc).isCalledWith(z.object({ name: z.string() })).thenReturn(66);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
mockedFunc({ name: "Victor" }); // 66
```

## Behaviours
### thenReturn
`when(mockedFunc).isCalled.thenReturn(value: any): When` will make the mock return the value passed as an argument when it is called.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenReturn(2);
mockedFunc(); // 2
```

### thenThrow
`when(mockedFunc).isCalled.thenThrow(error: Error): When` will make the mock throw the error passed as an argument when it is called.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenThrow(new Error("yoo"));
mockedFunc(); // throws Error("yoo")
```

### thenResolve
`when(mockedFunc).isCalled.thenResolve(value: any): When` will make the mock return a resolved promise with the value passed as an argument when it is called.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenResolve(2);
mockedFunc(); // Promise.resolves(2)
```

### thenReject
`when(mockedFunc).isCalled.thenReject(error: Error): When` will make the mock return a rejected promise with the error passed as an argument when it is called.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenReject(new Error("yoo"));
mockedFunc(); // Promise.rejects(Error("yoo"))
```

### thenCall
`when(mockedFunc).isCalled.thenCall((...args: any[]) => void): When` will make the mock call the function passed as an argument when it is called.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenCall((...args) => {
  console.log(args);
});
mockedFunc("hiii"); // logs ["hiii"]
```

### thenPreserve
`when(mockedFunc).isCalled.thenPreserve(): When` will keep the original function's behaviour when it is called, but will register the call history so that you can verify it later.

```ts
const mockedFunc = mockFunction(original);
when(mockedFunc).isCalled.thenPreserve();
mockedFunc(); // original function is called
```

### thenBehaveLike
`when(mockedFunc).isCalled.thenBehaveLike(original: Function): When` provides a way to fully control the behaviour of the mock. This is especially useful for complex scenarios, like returning once, then throwing, then returning again.

```ts
let callsCount = 0;
const mockedFunc = mockFunction(original);
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
const mockedFunc = mockFunction(takeNumber);

when(mockedFunc)
    .isCalledWith("Victor") // compiler will complain
    .thenReturn(42);

when(mockedFunc).unsafe
    .isCalledWith("Victor") // compiler will not complain: you can pass anything
    .thenReturn(42);
```

## zod integration
Mockit provides a powerful way to check if your mocked functions have been called with arguments matching a validation schema. This is especially useful when you want to check the nature of the arguments passed to your mocks, but don't know the exact value of them (this can happen when your code is generating them midway).

```ts
when(mockedFunc).isCalledWith(
  z.object({
    name: z.string(),
    age: z.number().positive().int(),
    id: z.string().uuid(),
    date: z.date(),
  })
).thenReturn(42);

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
You can verify how the mock was called using the `verifyThat` API. It provides a semantic way to verify the mock's behaviour. 
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
const mockedFunc = mockFunction(original);
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

# mockClass
You can mock classes using the `mockClass` API. It provides a semantic way to mock classes. It is built on top of the `mockFunction` API, by replacing the class' public functions with mocks generated by `mockFunction`.

```ts
class Hello {
  sayHello() {
    return "hello";
  }
}

const mockedClass = mockClass(Hello);
when(mockedClass.sayHello).isCalled.thenReturn("hello");
when(mockedClass.sayHello).isCalledWith("Victor").thenReturn("hello victor");

mockedClass.sayHello(); // "hello"
mockedClass.sayHello("Victor"); // "hello victor"
```

# mockAbstractClass
Abstract classes have two roles: they can be used as interfaces, or they can be used as base classes for other classes. Don't forget this one thing: your tests run in JavaScript, not in Typescript. This means that the class you are testing is not the class you wrote in Typescript, but the class that was transpiled to JavaScript.
And what happens at build time ? The abstract methods are removed from the class, as they are considered type signatures.

This is why we require you to pass a list of the abstract class' functions to mock, so that we can mock mock.

```ts
abstract class Hello {
  abstract sayHello(): string;
  abstract sayHi(): string;
}

const mockedClass = mockAbstractClass(Hello, ["sayHello"]);
// sayHello is mocked, sayHi is not.

when(mockedClass.sayHello).isCalled.thenReturn("hello");
```

# mockType & mockInterface
You can mock types and interfaces using the `mockType` API. It provides a semantic way to mock types and interfaces.
Any type or interface can be mocked (it also works with classes & abstract classes, as they are types too).
For the same reasons as abstract classes, you need to pass a list of the type's functions to mock.
The main difference with `mockAbstractClass` is that you need to pass the type as a generic parameter.

```ts
interface Hello {
  sayHello(): string;
  sayHi(): string;
  sayBye(): string;
}

const mockedType = mockType<Hello>("sayHello", "sayHi");
// sayHello and sayHi are mocked, sayBye is not.

when(mockedType.sayHello).isCalled.thenReturn("hello");
when(mockedType.sayHi).isCalled.thenReturn("hi");
```



### TODO
- [ ] Accept any mock in the Reset API
- [ ] Document the Reset API