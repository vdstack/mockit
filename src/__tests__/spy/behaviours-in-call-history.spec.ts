import { m } from "../..";
function toMock(x: number, y: string): any {}

describe("getMockHistory", () => {
  it("should provide which behaviours was applied for each call", () => {
    const mock = m.Mock(toMock);

    const mockHistory = m.getMockHistory(mock);
    mock(1, "hello");

    const calls = mockHistory.getCalls();
    expect(calls).toHaveLength(1);

    expect(calls[0]).toEqual({
      args: [1, "hello"],
      date: expect.any(Date),
      isDefault: true,
      behaviour: {
        kind: m.Behaviours.Return,
        returnedValue: undefined,
      },
    });
  });

  it("should provide data for custom behaviours too", () => {
    const mock = m.Mock(toMock);
    const mockHistory = m.getMockHistory(mock);

    m.when(mock).isCalledWith(2, "hello").thenReturn("something");

    mock(2, "hello");

    const callsAfterReset = mockHistory.getCalls();
    expect(callsAfterReset).toHaveLength(1);

    expect(callsAfterReset[0]).toEqual({
      args: [2, "hello"],
      date: expect.any(Date),
      isDefault: false,
      behaviour: {
        kind: m.Behaviours.Return,
        returnedValue: "something",
      },
      matched: [2, "hello"],
    });
  });

  it("should provide data for matchers behaviours as well", () => {
    const mock = m.Mock(toMock);
    const mockHistory = m.getMockHistory(mock);

    m.when(mock).isCalledWith(m.anyNumber(), "hello").thenReturn("something");

    mock(2, "hello");

    const callsAfterReset = mockHistory.getCalls();
    expect(callsAfterReset).toHaveLength(1);

    expect(callsAfterReset[0]).toEqual({
      args: [2, "hello"],
      date: expect.any(Date),
      isDefault: false,
      behaviour: {
        kind: m.Behaviours.Return,
        returnedValue: "something",
      },
      matched: [m.anyNumber(), "hello"],
    });
  });
});
