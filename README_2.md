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

- [Mocks](#mocks)
  - [Different types of mocks](#different-types-of-mocks)
    - [Function](#function)
    - [Class](#class)
    - [Interfaces and types](#interfaces-and-types)
    - [Abstract classes](#abstract-classes)
  - [Default behaviour](#default-behaviour)
  - [Custom behaviour](#custom-behaviour)


# Mocks

## Different types of mocks

You can mock functions, classes, abstract classes, interfaces and types. Functions mocks are the base of the library.
Every other type of mock (class, abstract class, interface, type) is built on top of function mocks.

For example, mocking a class is equivalent to mocking all its public functions.
![image (2)](https://github.com/vdstack/mockit/assets/6061078/41a4da91-00ee-4a6c-a0f5-115386cb760e)

Understanding how to handle function mocks in Mockit will unlock any other type of mock.

const mockedClass = mockClass(MyClass);
```

### Function
 Everything is built on top of them: classes, abstract classes, interfaces and types public functions are mocked functions.

```ts
function hello() {
  /**/
}

const mockedFunc = mockFunction(hello);
```



### Class

```ts
