[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking behaviour](https://martinfowler.com/articles/mocksArentStubs.html) in TypeScript. With its help, patterns like Strategy, or Ports & Adapters, become super easy to unit test. Its API was inspired by Java's Mockito package, but has diverged along the way. Mockito's knowledge is easily transferable though. It's main objective is to make it easy to [setup](#when) and [verify](#verifyThat) the behaviour of mocks, while ensuring that your tests are not fragile [by providing ways to decouple your tests](#Matchers) from as many superflous details as possible.

It's been used in all its successive versions by around 20 engineers at @Skillup, for almost two years now, so you can consider it battle tested.

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

Finally, you can leverage a whole suite of matchers: they're the recommended way to use Mockit, as they make your tests more resilient to changes in the implementation, and more focused on the logic you want to test. All in all, they make your tests easier to write and maintain.

See the [Matchers](#matchers) section for detailed instructions on how to use them.

```ts
mockedFunc({
  name: "Victor",
  age: 42,
  email: "vic@vic.fr",
  nationality: "French",
  hobbies: ["coding", "reading", "making music", "video games"],
});

/**
 * Here the matcher m.arrayContaining combined with m.any.string() can help you create a more resilient test: hobbies values are not important as long as they are an array of strings.
 *
 * Similarly, the m.objectContaining matcher is used to avoid checking properties that are not important for the test: you focus on the age and hobbies properties.
 */
verifyThat(mockedFunc).wasCalledOnceWith(
  m.objectContaining({
    age: m.validates(z.number().int().positive()),
    hobbies: m.arrayContaining(m.any.string()),
  })
);
```

Feel free to contribute :)

This documentation is very thoughrough, if you think you already know how Mockit works but are looking for concrete ideas on how to use it, head to the [tutorial section](https://github.com/vdstack/mockit/tree/master/src/tutorial)

- [Mock](#Mock)
  - [Functions](#Functions)
  - [Classes](#Classes)
  - [Abstract classes](#Abstract-classes)
  - [Types and interfaces](#Types-and-interfaces)
  - [Object modules](#Object-modules)
  - [Interacting with the mocks](#Interacting-with-the-mocks)
- [when](#when)
  - [Behaviours control](#Behaviours-control)
  - [Behaviours](#Behaviours)
    - [thenReturn](#thenReturn)
    - [thenThrow](#thenThrow)
    - [thenResolve](#thenResolve)
    - [thenReject](#thenReject)
    - [thenPreserve](#thenPreserve)
    - [thenBehaveLike](#thenBehaveLike)
  - [Setup with matchers](#Setup-with-matchers)
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
- [Matchers](#Matchers)
  - [Categorial matchers](#Categorial-matchers)
    - [m.any](#m.any)
    - [isOneOf](#isOneOf)
    - [instanceOf](#instanceOf)
    - [unsafe](#unsafe)
  - [Rule-based matchers](#Rule-based-matchers)
    - [m.validates](#m.validates)
  - [Structure-based matchers](#Structure-based-matchers)
    - [objectContaining](#objectContaining)
    - [arrayContaining](#arrayContaining)
    - [mapContaining](#mapContaining)
    - [setContaining](#setContaining)
    - [Deep matchers](#Deep-matchers)
  - [String matchers](#String-matchers)
    - [stringContaining](#stringContaining)
    - [stringStartingWith](#stringStartingWith)
    - [stringEndingWith](#stringEndingWith)
    - [stringMatching](#stringMatching)
  - [Combining matchers](#Combining-matchers)
    - [or](#or)
    - [Composition](#Composition)

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
- `when(mockedFunc).isCalledWith(...args)` will setup the mock to return a value when called with specific arguments. This is what we call **custom behaviours**.
  ![image](https://github.com/user-attachments/assets/63c2aa4a-65f7-4b99-8948-12aa033c763e)

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

Matchers are a powerful tool to make your tests **more resilient to changes** in the implementation, and **more focused on the specific bits of logic** you want to test. **They're made with the intent to reduce the time needed to code and maintain your tests**.
If you know `jest.objectContaining`, you will feel right at home with Mockit's matchers. In fact, Mockit provides a lot more matchers than Jest does.

For setup, they can be used in place of any value passed to the isCalledWith function.

For assertions, they can be used in place of the expected values in the `verifyThat(mock).wasCalledWith(...)` function.

```ts
// In this test I only care about the age, and id properties of the object passed to the mocked function.
when(mockedFunc)
  .isCalledWith(
    m.objectContaining({
      age: m.validates(z.number().positive().int()),
      id: m.any.string(),
    })
  )
  .thenReturn(42);

// This will match the setup above, even though the name, hobbies, company & nationality properties
// are not checked: the test is more resilient to changes in the implementation and focuses
// on the properties that are important for the test.
const response = mockedFunc({
  name: "Victor",
  age: 42,
  id: "123e4567-e89b-12d3-a456-426614174000",
  nationality: "French",
  hobbies: ["coding", "reading", "making music", "video games"],
  company: "VDStack",
}); // 42
```

For more information about matchers, see the [Matchers](#matchers) section.

## Returning a partial value

In a lot of tests, you don't need to provide your mocks with a full object as a response, because you know that only a few keys will be used by the module under test. Mockit provides a way to return a partial object, using the `m.partial` matcher.

TypeScript will help you by providing auto-completion and type-checking, but at the same time will not complain if you don't provide all the keys that would normally be required by the type of the object.

```ts
type User {
  // .... a very big type
}

// You know that only the id property will be used by the module under test.

const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(m.partial({ id: "1" }));
```

This works with any object, and is functional deep down the object tree.

```ts
type Response = {
  user: {
    id: string;
    // ... a very big type
  };
};

const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(m.partial({ user: { id: "1" } }));
```

# verifyThat

You can verify how the mock was called using the `verifyThat` API. It provides a semantic way to verify a function mock behaviour.
It couples your test code with the module under test implementation though, so use it carefully, when it makes sense to verify a behaviour that cannot be tested by reading the module's returned value (for example, when testing side-effects). **Matchers can help reduce this coupling** (see the [Matchers](#matchers) section).

It can also be useful to test that a dependency was **NOT** called in a specific branch of your code.

## Verifications

You get a wide range of verifications available to you, from checking the number of times the mock was called, to checking the arguments passed to it.
![image](https://github.com/vdstack/mockit/assets/6061078/60299ab4-0015-4274-b856-02af9f53f5fb)

### wasCalled

`verifyThat(mockedFunc).wasCalled()` will assert that the mock was called at least once.

### wasCalledWith

`verifyThat(mockedFunc).wasCalledWith(...args: any[])` will assert that the mock was called at least once with the specified arguments. These arguments are type-checked, which prevent you from going blind when asserting.

### wasCalledOnce

`verifyThat(mockedFunc).wasCalledOnce()` will assert that the mock was called exactly once.

### wasCalledOnceWith

`verifyThat(mockedFunc).wasCalledOnceWith(...args: any[])` will assert that the mock was called exactly once with the specified arguments. These arguments are type-checked, which prevent you from going blind when asserting.

### wasCalledNTimes

`verifyThat(mockedFunc).wasCalledNTimes(n: number)` will assert that the mock was called exactly `n` times.

### wasCalledNTimesWith

`verifyThat(mockedFunc).wasCalledNTimesWith(n: number, ...args: any[])` will assert that the mock was called exactly `n` times with the specified arguments. These arguments are type-checked, which prevent you from going blind when asserting.

### wasNeverCalled

`verifyThat(mockedFunc).wasNeverCalled()` will assert that the mock was never called.

### wasNeverCalledWith

`verifyThat(mockedFunc).wasNeverCalledWith(...args: any[])` will assert that the mock was never called with the specified arguments. These arguments are type-checked, which prevent you from going blind when asserting.

# Matchers

**Matchers are the recommended way to use Mockit.** They help making tests more resilient to changes in the implementation, and more focused on the logic you want to test. They can be used both in the `when` and `verifyThat` functions.

## What are matchers ?

Using mocks in tests is very powerful, but can lead to very brittle tests if you're not careful. You can easily end up with tests that break every time you change the implementation of the module under test, even if the logic you're testing is still correct.

One solution to this problem **is not to use mocks at all and focus on I/O testing (aka black-box testing)**, but that's not always possible, especially when you're testing complex logic that depends on external services or libraries, when you're testing side-effects, or when the module under test is hitting multiple data-sources.

Another solution **is not to assert against specific values, but against more generic logic**.
This is where matchers come in: they represent **categories of values** instead of specific ones, or **rules that the values must comply with** instead of the values themselves.

For example, the `m.anyString()` matcher will match any string passed to the mocked function, or the `m.validates(z.number().positive().int())` matcher to match any positive integer (using the Zod library).
If you know `jest.objectContaining`, you will feel right at home with Mockit's matchers. In fact, Mockit provides a lot more matchers than Jest does.

## How to use matchers ?

Matchers are functions that you can call in place of any value passed to the `isCalledWith` function in the `when` API, or in place of the expected values passed to the `wasCalledWith` (and similar) functions in the `verifyThat` API.

Matchers trick the compiler into accepting them as valid values, but are detected by Mockit and used to compare the actual values to the more generic rules defined by the matcher: that's a convoluted way of saying that **you can use them everywhere without worrying about the type-checking**.

## Categorial matchers

### any

`m.any` provides a wide range of matchers for each common category of values. It requires no dependency and is the most versatile set of matchers.

```ts
m.anyString(); // matches any string
m.anyNumber(); // matches any number
m.anyBoolean(); // matches any boolean
m.anyArray(); // matches any array
m.anyObject(); // matches any object: will not match arrays, Maps, Sets & null
m.anyFunction(); // matches any function
m.anyMap(); // matches any Map
m.anySet(); // matches any Set
m.anyNullish(); // matches anything x when (x == null)
m.anyTruthy(); // matches anything x when (!!x)
m.anyFalsy(); // matches anything x when (!x)
```

### isOneOf

`m.isOneOf` is a matcher that accepts an array of values, and matches any value that is in the array. This is useful when you know in advance the possible values that can be passed, often when you're testing enums.

```ts
const Directions = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
} as const;

verifyThat(mockedFunc).wasCalledWith(m.isOneOf(Object.values(Directions)));
```

### instanceOf

`m.instanceOf` is a matcher that accepts a class, and matches any instance of that class. This makes your tests resistant to changes by avoiding checking some properties of the object, and focusing on the class itself.

```ts
class Person {
  constructor(public name: string, public age: number) {}
}

verifyThat(mockedFunc).wasCalledWith(m.instanceOf(Person));
```

### unsafe

You might need to escape from the type-safety of Mockit. This is not recommended, but has its use-cases.

```ts
function takesNumber(n: number) {
  return n;
}

const mockedFunc = Mock(takesNumber);
when(mockedFunc).isCalledWith(m.unsafe("42")).thenReturn(42);
mockedFunc(42); // 42
```

## Rule-based matchers

### validates

You can provide a custom validation function thanks to the `validates` matcher.
It accepts a function that will be called with the actual value and the expected value.
It should return `true` if the actual value matches the expected value, and `false` otherwise.

```ts
const mockedFunc = Mock(original);
mockedFunc(55);

verifyThat(mockedFunc).wasCalledWith(m.validates((actual) => actual > 50));
```

validates also accepts a Zod schema, which will be used to validate the actual value.

```ts
const mockedFunc = Mock(original);
mockedFunc(55);

verifyThat(mockedFunc).wasCalledWith(m.validates(z.number().positive().gt(50)));
```

## Structure-based matchers

Mockit provides a wide range of matchers to match the structure of objects, arrays, Maps, Sets, etc...
These matchers are useful when you want to focus on specific properties of the object passed to the mocked function, and ignore the rest.

### objectContaining

`m.objectContaining` is a matcher that will focus on the properties you specify, and ignore any other properties of the object passed to the mocked function. This is a very common use-case, for example when you want to verify that a function was called with a specific ID, or that a specific property was parsed correctly.

```ts
type Deps = { save: (p: { id: string; age: string }) => void };
function doesSomethingWithAge(age: string, deps: Deps) {
  deps.save({
    id: "123e4567-e89b-12d3-a456-426614174000",
    age: parseInt(age, 10),
  });
}

test("it should save the parsed age", () => {
  const mockedDeps = Mock<Deps>();
  doesSomethingWithAge("42", mockedSave);

  verifyThat(mockedDeps.save).wasCalledOnceWith(
    m.objectContaining({
      age: 42,
    })
  );
});
```

### arrayContaining

Similar to `m.objectContaining`, `m.arrayContaining` will focus on the elements you specify, and ignore any other elements of the array passed to the mocked function.

```ts
const forbiddenHobbies = ["gambling"];

type Deps = { save: (p: { id: string; hobbies: string[] }) => void };
function doesSomethingWithHobbies(hobbies: string[], deps: Deps) {
  deps.save({
    id: "123e4567-e89b-12d3-a456-426614174000",
    hobbies: hobbies.filter((hobby) => !forbiddenHobbies.includes(hobby)),
  });
}

test("it should not save the forbidden hobbies", () => {
  const mockedDeps = Mock<Deps>();
  doesSomethingWithHobbies(["coding", "reading", "gambling"], mockedSave);

  verifyThat(mockedDeps.save).wasCalledOnce();
  verifyThat(mockedDeps.save).wasNeverCalledWith(
    m.objectContaining({
      hobbies: m.arrayContaining(["gambling"]),
    })
  );
});
```

### mapContaining

Similar to `m.objectContaining`, `m.mapContaining` will focus on the entries you specify, and ignore any other entries of the Map passed to the mocked function.
Just pass a Map to the matcher that contains the entries you want to check.

```ts
m.mapContaining(new Map([["key1", "value1"]])); // matches any Map containing the entry ["key1", "value1"]
```

### setContaining

Similar to `m.arrayContaining`, `m.setContaining` will focus on the elements you specify, and ignore any other elements of the Set passed to the mocked function.
Litteraly pass a subset of the Set you want to check.

```ts
const actualSet = new Set(["value1", "value2"]);

m.setContaining(new Set(["value1"])); // matches any Set containing the value "value1"
```

### Deep matchers

`m.objectContaining`, `m.arrayContaining`, `m.mapContaining` and `m.setContaining` all have deep variants: `m.objectContainingDeep`, `m.arrayContainingDeep`, `m.mapContainingDeep` and `m.setContainingDeep`.

These deep matchers will recursively check the structure of the object, array, Map or Set passed to the mocked function, and ignore any other properties or elements.

This is **very** useful when you're dealing with deeply nested structures but simply want to focus on one specific property deep down the tree.

```ts
/**
 * This will match any object that has a obj.x.y.z.a property equal to 42, and ignore any other properties of the object.
 */
m.objectContainingDeep({
  x: {
    y: {
      z: {
        a: 42,
      },
    },
  },
});

/**
 * This will match any array that matches at least once arr[i][j][k] === 42, and ignore any other elements of the array.
 */

m.arrayContainingDeep([[[[42]]]]);
```

## String matchers

Mockit provides 4 matchers to match strings: `m.stringContaining`, `m.stringStartingWith`, `m.stringEndingWith` and `m.stringMatching`.

### stringContaining

`m.stringContaining("bubble")` will match any string that contains the substring "bubble".

### stringStartingWith

`m.stringStartingWith("bubble")` will match any string that starts with the substring "bubble".

### stringEndingWith

`m.stringEndingWith("bubble")` will match any string that ends with the substring "bubble".

### stringMatching

`m.stringMatching(reg:RegExp)` will match any string that matches the regular expression passed as an argument.

## Combining matchers

### or

With the `m.or` matcher, you can build custom matchers that accept a wider range of values. For example, you can match any number that is either positive or negative, while rejecting zero.

```ts
m.or(m.any.number().positive(), m.any.number().negative());
```

### Composition

Mockit matchers are functions, which means you can compose them together to build matchers that are more specific to your needs.

```ts
/**
 * This will match any object that has an age property that is a positive integer, and a hobbies property that is an array of email strings.
 */
m.objectContaining({
  age: m.validates(z.number().positive().int()),
  hobbies: m.arrayContaining([m.validates().string().email()]),
});
```
