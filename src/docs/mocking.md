# Mocking with Mockit

You can mock functions, classes, abstract classes, objects, interfaces and types with the same function `Mock`.

## Functions

```ts
function hello() {
  return "hello";
}

const mockedFunc = Mock(hello);
```

## Classes

```ts
class Hello {
  sayHello() {
    return "hello";
  }
}

const mockedClass = Mock(Hello);
```

## Abstract classes

```ts
abstract class Hello {
  abstract sayHello(): string;
}

const mockedAbstractClass = Mock(Hello);
```

## Types and interfaces

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

## Object modules

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
