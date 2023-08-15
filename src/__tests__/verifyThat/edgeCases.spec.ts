import { mockFunction, verifyThat } from "../../mockit";

describe("verifyThat edgecases", () => {
  it("should not take into account undefined values", () => {
    /**
     * This is a bit technical.
     * Let's imagine you have a function A that calls B with a
     * parameter that has optional keys.
     *
     * ex: function A(b:B) {
     *   const parameters = {};
     *   if (something) { parameters.x = 1 };
     *   if (somethingElse) { parameters.y = 2 };
     *
     *   b.func(parameters);
     * }
     *
     * This is trivial to test:
     *
     * test("should call B with x if something", () => {
     *  const bMock = mockInterface<B>("func");
     *  // ... setup something
     *  A(bMock);
     *
     *  verifyThat(bMock.func).wasCalledWith({x: 1});
     * });
     *
     *
     * Now, if you code A in another way, it used not to work in mockit:
     * Here's the problematic way
     *
     * ex: function A(b:B) {
     *  const parameters = {
     *      x: something ? 1 : undefined,
     *      y: somethingElse ? 2 : undefined
     *  };
     *
     *  b.func(parameters);
     * }
     *
     * This caused parameters to contains keys with value undefined.
     * This is not a problem in real life, but it was a problem in mockit.
     * verifyThat would fail because it would compare {x: 1, y: undefined} with {x: 1}.
     *
     * It will display an error like this:
            * Function "hello" was not called exactly once with parameters
            *   [
                    {
                        "x": 1
                    }
                ]
            It was called once with arguments:
                [
                    {
                        "x": 1
                    }
                ]
     * This test asserts that it doesn't fail anymore.

     * NDLR: I'm not sure this is a valid behaviour though,
        after all you could test that the function is called with
        {x: 1, y: undefined}, and that would be a valid test.
        Introducing this "magic" behaviour might not be a good idea
        and might break in weird ways.

     */

    function hello(_params: { x?: number; y?: number }) {}

    const mockedHello = mockFunction(hello);
    mockedHello({ x: 1, y: undefined });

    // this will throw if the bug is still there
    verifyThat(mockedHello).wasCalledOnceWith({ x: 1 });
  });
});
