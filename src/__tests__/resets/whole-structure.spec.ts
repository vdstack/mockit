import { Mock, Reset } from "../../mocks";
import { verifyThat } from "../../assertions";
import { when } from "../../behaviours";

class Hellaw {
  public hiii() {
    return "hiii";
  }

  public hello() {
    return "hello";
  }
}

test("reset should be able to reset history for all the functions of a class mock", async () => {
  const mock = Mock(Hellaw);

  mock.hiii();
  mock.hello();

  verifyThat(mock.hiii).wasCalledOnce();
  verifyThat(mock.hello).wasCalledOnce();

  Reset.historyOf(mock);

  verifyThat(mock.hiii).wasNeverCalled();
  verifyThat(mock.hello).wasNeverCalled();
});

it("should be able to reset the behaviour of all the functions of a class mock", async () => {
  const mock = Mock(Hellaw);

  when(mock.hiii).isCalled.thenReturn("hiii");
  when(mock.hello).isCalled.thenReturn("hello");

  expect(mock.hiii()).toBe("hiii");
  expect(mock.hello()).toBe("hello");

  Reset.behaviourOf(mock);

  expect(mock.hiii()).toBeUndefined();
  expect(mock.hello()).toBeUndefined();
});

it("should be able to reset completely all the functions of a class mock", async () => {
  const mock = Mock(Hellaw);

  when(mock.hiii).isCalled.thenReturn("hiii");
  when(mock.hello).isCalled.thenReturn("hello");

  expect(mock.hiii()).toBe("hiii");
  expect(mock.hello()).toBe("hello");

  verifyThat(mock.hiii).wasCalledOnce();
  verifyThat(mock.hello).wasCalledOnce();

  Reset.completely(mock);
  verifyThat(mock.hiii).wasNeverCalled();
  verifyThat(mock.hello).wasNeverCalled();

  expect(mock.hiii()).toBeUndefined();
  expect(mock.hello()).toBeUndefined();
});
