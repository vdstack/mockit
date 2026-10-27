import { m } from "../..";

function returnsSomething(x: string): string {
    return `${x} something`;
}

function resolvesSomething(x: string): Promise<string> {
    return Promise.resolve(`${x} something`);
}

function sut(x: string, rs: typeof returnsSomething) {
    return rs(x);
}

it("should pass types or generate errors, and control the basic behaviours", () => {
    expect(sut("hello", m.returns("23"))).toBe("23");
    // @ts-expect-error - function should not return (it's synchronous). This expect error is a type check !
    expect(sut("hello", m.resolves("23"))).resolves.toBe("23");
    // @ts-expect-error - function should not reject (it's synchronous). This expect error is a type check !
    expect(sut("hello", m.rejects(new Error("23")))).rejects.toThrow("23");
    expect(() => sut("hello", m.throws(new Error("23")))).toThrow("23");
});

async function sutAsync(x: string, rs: typeof resolvesSomething) {
    return rs(x);
}

// If you pay attention to this test, you will find that it is not checking the exact symetrical behaviour of the synchronous version:
// - in the synchronous version, we only accept .returns and .throws, and the compiler will generate errors for .resolves and .rejects
// - BUT in the asynchronous version, the compiler will NOT generate an error for .throws().
// WHY ?
// because () => never is assignable to pretty much anything...
// () => never is assignable to anything, so also to () => Promise<T> for any T.
// On the other hand, () => T is not assignable to () => Promise<T> for any T.
// So, the compiler will not generate an error for .throws() in the asynchronous version. I didn't find any clean way to make it do it without breaking something else :'(
it("should do it asynchronously", async () => {
    expect(sutAsync("hello", m.resolves("23"))).resolves.toBe("23");
    expect(sutAsync("hello", m.rejects(new Error("23")))).rejects.toThrow("23");
    expect(sutAsync("hello", m.throws(new Error("23")))).rejects.toThrow("23");
    // @ts-expect-error - function should not return (it's asynchronous). This expect error is a type check !
    expect(await sutAsync("hello", m.returns("23"))).toBe("23");
    // here it's presented as a promise, so types should pass !
    expect(sutAsync("hello", m.returns(new Promise((resolve) => resolve("23"))))).resolves.toBe("23");
});





