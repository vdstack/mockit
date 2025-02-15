# Controlling Mock Behavior with `when`

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

For more information about matchers, see the [Matchers](./matchers.md) section.

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
