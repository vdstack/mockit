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
