import { Mockit } from "./mockit";

class Dog {
  makeSound(): void {}
  repeatSound(_sound: string): void {}
}

describe("Mockit > thenReturn", () => {
  test("it should allow to replace a class function returned value", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog).calls("makeSound", []).thenReturn("CROAAA!");

    expect(mockDog.makeSound()).toBe("CROAAA!");
  });

  test("it should be able to mock different calls separately", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("yo");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("HELLAW!");

    expect(mockDog.repeatSound("A")).toBe("yo");
    expect(mockDog.repeatSound("B")).toBe("HELLAW!");
    expect(mockDog.repeatSound("A")).toBe("yo");
  });
});
