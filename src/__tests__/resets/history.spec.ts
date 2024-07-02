import { m, Mock, verifyThat } from "../..";

function add(a: number, b: number): number {
  return a + b;
}

test("resetHistory should reset the history of calls", () => {
  const mockAdd = Mock(add);

  mockAdd(1, 2);
  mockAdd(3, 2);
  mockAdd(-1, 2);

  verifyThat(mockAdd).wasCalled();
  verifyThat(mockAdd).wasCalledWith(1, 2);
  verifyThat(mockAdd).wasCalledWith(3, 2);
  verifyThat(mockAdd).wasCalledWith(-1, 2);
  verifyThat(mockAdd).wasCalledNTimes(3);

  m.reset.historyOf(mockAdd);

  verifyThat(mockAdd).wasNeverCalled();
});
