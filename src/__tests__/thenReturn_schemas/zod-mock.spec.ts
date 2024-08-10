import { z } from "zod";
import { m } from "../..";

function hi(): any {};

test("thenReturn should accept a Zod schema and return a valid object", () => {
    const schema = z.object({
        name: z.string(),
        age: z.number(),
    });
    
    const mock = m.Mock(hi)
    m.when(mock).isCalled.thenReturn(m.validates(schema));
    
    const result = mock();
    expect(result).toMatchObject({
        name: expect.any(String),
        age: expect.any(Number),
    })
});

