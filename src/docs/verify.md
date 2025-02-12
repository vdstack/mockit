# Verifying Mock Behavior with `verifyThat`

You can verify how the mock was called using the `verifyThat` API. It provides a semantic way to verify a function mock behaviour.
It couples your test code with the module under test implementation though, so use it carefully, when it makes sense to verify a behaviour that cannot be tested by reading the module's returned value (for example, when testing side-effects). **Matchers can help reduce this coupling** (see the [Matchers](./matchers.md) section).

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
