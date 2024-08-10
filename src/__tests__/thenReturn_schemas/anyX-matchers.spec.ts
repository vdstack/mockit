import { m } from "../..";

function hi(): any {};

test("thenReturn should accept a basic a m.any matcher and return a corresponding object", () => {
    const mock = m.Mock(hi);
    m.when(mock).isCalled.thenReturn(m.anyArray());
    expect(Array.isArray(mock())).toBe(true);

    m.when(mock).isCalled.thenReturn(m.anyBoolean());
    expect(typeof mock()).toBe("boolean");

    m.when(mock).isCalled.thenReturn(m.anyNumber());
    expect(typeof mock()).toBe("number");

    m.when(mock).isCalled.thenReturn(m.anyObject());
    expect(typeof mock()).toBe("object");

    m.when(mock).isCalled.thenReturn(m.anyString());
    expect(typeof mock()).toBe("string");

    m.when(mock).isCalled.thenReturn(m.anyFunction());
    expect(typeof mock()).toBe("function");

    m.when(mock).isCalled.thenReturn(m.anyMap());
    expect(mock()).toBeInstanceOf(Map);

    m.when(mock).isCalled.thenReturn(m.anySet());
    expect(mock()).toBeInstanceOf(Set);

    m.when(mock).isCalled.thenReturn(m.anyNullish());
    const nullishResult = mock();
    expect(nullishResult === undefined || nullishResult === null).toBe(true);

    m.when(mock).isCalled.thenReturn(m.anyFalsy());
    const falsyResult = mock();
    expect(!falsyResult).toBe(true);

    m.when(mock).isCalled.thenReturn(m.anyTruthy());
    const truthyResult = mock();
    expect(!!truthyResult).toBeTruthy();
});
