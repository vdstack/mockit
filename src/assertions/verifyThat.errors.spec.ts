import { m, verifyThat, when } from "..";

function toMock(...args: any[]): any {}
describe("verifyThat.errors", () => {
  it("should provide information about the error", () => {
    expect.assertions(1);
    try {
      const mock = m.Mock(toMock);

      mock(1, 2, 3);
      mock(new Error("azezaeaz"), new Date());

      verifyThat(mock).wasCalledWith("Victor");
    } catch (err) {
      expect(true).toBe(true);
      console.log(err);
    }
  });

  it("should work with throw behaviour", () => {
    const mock = m.Mock(toMock);
    when(mock).isCalledWith("Victor").thenThrow(new Error("azezaeaz"));

    expect.assertions(2);
    expect(() => mock("Victor")).toThrow();

    try {
      verifyThat(mock).wasCalledWith("yolo");
    } catch (err) {
      expect(true).toBe(true);
      console.log(err);
    }
  });
});
