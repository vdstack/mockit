/**
 * With the thenPreserve behaviour, you can actually preserve the original behaviour of a function in the mock,
 * while still being able to verify how it was called.
 */

import { m } from "..";

function getIntegerOddity(id: number) {
    if (id % 2 === 0) {
        return "Even";
    }

    return "Odd";
}

test("you can preserve the original behaviour of a function", () => {
    const mockedFunction = m.Mock(getIntegerOddity);
    m.when(mockedFunction).isCalled.thenPreserve();

    expect(mockedFunction(1)).toBe("Odd");
    expect(mockedFunction(2)).toBe("Even");
    expect(mockedFunction(3)).toBe("Odd");
    expect(mockedFunction(4)).toBe("Even");

    m.verifyThat(mockedFunction).wasCalledWith(1);
    m.verifyThat(mockedFunction).wasCalledWith(2);
    m.verifyThat(mockedFunction).wasCalledWith(3);
    m.verifyThat(mockedFunction).wasCalledWith(4);

    m.verifyThat(mockedFunction).wasNeverCalledWith(5);
    m.verifyThat(mockedFunction).wasCalledNTimesWith({
        howMuch: 2,
        args: [m.validates((value) => value % 2 === 0)]
    });
});
