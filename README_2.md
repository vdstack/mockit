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
```

You can then verify how the mock was called.

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

