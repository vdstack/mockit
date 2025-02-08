[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking behaviour](https://martinfowler.com/articles/mocksArentStubs.html) in TypeScript. With its help, patterns like Strategy, or Ports & Adapters, become super easy to unit test. Its API was initially inspired by Java's Mockito package, but has diverged along the way. Mockito's knowledge is easily transferable though. It's main objective is to make it easy to setup and verify the behaviour of mocks, while ensuring that your tests are not fragile by providing ways to decouple your tests from as many superflous details as possible. It also provides a powerful assertion library to make your tests more readable and maintainable.

It's been used in all its successive versions by around 20 engineers at @Skillup, for almost two years now, so you can consider it battle tested.

Mockit API can mock any dependency:

- functions: `Mock(originalFunction)`
- classes: `Mock(originalClass)`
- Abstract classes: `Mock(abstractClass)`
- Object modules: `Mock(originalObject)`
- Types and interfaces: `Mock<Type>()` or `Mock<Interface>()`

It provides a semantic API that is easy to use, as well **as complete type-safety**, which helps a LOT when writing tests, as it provides auto-completion and type-checking alerting you of any invalid test setup.

## Quick Examples

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

These verifications are assertive, meaning your test will fail if the mock was not called the way you expected it to be. No assertion library necessary!
They are agnostic of the test runner and assertion library you use.

Finally, you can create powerful and robust assertions to make your tests more readable and maintainable.

```ts
const result = someFunction();

m.expect(result).toEqual(m.anyString());

// This will only check that result.user.properties.id is a valid uuid => test is resilient to changes unless the specific property under test is changed.
m.expect(result).toEqual(
  m.objectContainingDeep({
    user: {
      properties: {
        id: m.validates(z.string().uuid()),
      },
    },
  })
);
```

## Documentation

Start with our [comprehensive documentation guide](./docs/README.md) to learn all about Mockit's features and best practices.

Individual documentation sections:

- [Creating Mocks](./docs/mocking.md)
- [Controlling Mock Behavior](./docs/when.md)
- [Verifying Mock Interactions](./docs/verify.md)
- [Writing Resilient Tests with Matchers](./docs/matchers.md)
- [Assertions](./docs/assertions.md)

Feel free to contribute :)

If you think you already know how Mockit works but are looking for concrete ideas on how to use it, head to the [tutorial section](https://github.com/vdstack/mockit/tree/master/src/tutorial)
