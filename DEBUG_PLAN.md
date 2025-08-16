# TODO:

I feel like toMatch should not work as a compare(containingDeep) for objects & arrays. Because it causes weird unexpected behaviour
for arrays & objects deeply nested.

For example, if

m.expect({
    x: {
        y: [1, 2, 3],
    }
}).toMatch({
    x: {
        y: [],
    }
});

=> This will work, because even though the array is empty, it's considering it as "any array" since it converts into a containingDeep function.

I think it should not be the default behaviour.

So i'm considering the add a toMatchDeep, or simply to keep the toMatch while allowing (as it already does) composing matchers:
m.expect({
    x: {
        y: m.arrayContaining([1, 2, 3]),
    }
}).toMatch({
    x: {
        y: m.arrayContaining([]),
    }
});

or m.anyArray(), etc...

=> This makes it more explicit, even though a bit less flexible type-wise.

But for deep objects, it would be enough to do this:

m.expect({
    x: {
        y: [1, 2, 3],
        z: {
            a: {
                b: {
                    c: "test",
                    d: 123,
                    e: true,
                }
            },
            f: [1, 2, 3]
        }
    }
}).toMatch({
    x: {
        y: m.anyArray(),
        z: m.objectMatching({
            a: { // As you can see here, with objectMatching we can provide a pattern that will ignore anything else.
                b: {
                    c: m.anyString(),
                }
            }
        })
    }
})