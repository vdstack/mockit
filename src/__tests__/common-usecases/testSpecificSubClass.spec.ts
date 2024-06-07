import { Reset, mockFunction, verifyThat, when } from "../..";

/**
 * This example comes from Clean Code Video series by Robert C. Martin
 * In particular, its Mocking video, part 2.
 */

class CowMilker {
  constructor() {}

  protected pump() {
    // real implementation
    throw new Error("Not implemented");
  }

  protected checkSeal(): boolean {
    // real implementation
    throw new Error("Not implemented");
  }

  public milk() {
    if (!this.checkSeal()) throw new Error("Seal is broken");
    this.pump();
  }
}

describe("Test specific subclass", () => {
  let mockPump: () => void;
  let mockCheckSeal: () => boolean;
  beforeAll(() => {
    mockPump = mockFunction(() => {});
    mockCheckSeal = mockFunction(() => true);
  });

  beforeEach(() => {
    Reset.historyOf(mockCheckSeal, mockPump);
  });

  class TestCowMilker extends CowMilker {
    protected pump() {
      return mockPump();
    }
    protected checkSeal(): boolean {
      return mockCheckSeal();
    }
  }

  test("Cow milker should check the seal and pump", () => {
    const milker = new TestCowMilker();
    when(mockCheckSeal).isCalled.thenReturn(true);
    milker.milk();
    verifyThat(mockCheckSeal).wasCalledOnce();
    verifyThat(mockPump).wasCalledOnce();
  });

  test("Cow milker should throw error if seal is broken", () => {
    const milker = new TestCowMilker();
    when(mockCheckSeal).isCalled.thenReturn(false);
    expect(() => milker.milk()).toThrowError("Seal is broken");
    verifyThat(mockCheckSeal).wasCalledOnce();
    verifyThat(mockPump).wasNeverCalled();
  });
});
