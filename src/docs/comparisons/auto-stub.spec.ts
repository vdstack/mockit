import { m } from "../..";
/**
 * In this example, we have an interface with many methods.
 * We want to test a service that uses this interface.
 * We want to be able to test the service without having to implement all the methods of the interface.
 * This can be done in Jest but it's verbose, and not type-safe.
 * Mockit makes it much easier and safer.
 */

interface IExtensiveDependency {
  methodA(x: number): string;
  methodB(y: string): boolean;
  methodC(z: boolean): number;
  methodD(): Promise<void>;
  methodE(a: string, b: number): string[];
  // ... imagine many more methods here ...
  methodUsedInTest(data: string): string;
}

class MyService {
  constructor(private dependency: IExtensiveDependency) {}

  processData(input: string): string {
    return this.dependency.methodUsedInTest(input) + " processed";
  }
}

// --- Jest (Option 1: All Methods - Verbose and Fragile) ---

test("processData - Jest (All Methods)", () => {
  // You MUST provide implementations for ALL methods, even though only one is used:
  const mockDependency: IExtensiveDependency = {
    methodA: jest.fn(),
    methodB: jest.fn(),
    methodC: jest.fn(),
    methodD: jest.fn(),
    methodE: jest.fn(),
    // ... and for all other methods in the interface ...
    methodUsedInTest: jest.fn().mockReturnValue("test result"),
  };

  const service = new MyService(mockDependency);
  const result = service.processData("input data");

  expect(result).toBe("test result processed");
  expect(mockDependency.methodUsedInTest).toHaveBeenCalledWith("input data");
});

// --- Jest (Option 2: @ts-ignore - Dangerous) ---

test("processData - Jest (@ts-ignore)", () => {
  // @ts-ignore suppresses the error, but it's DANGEROUS:
  // - You lose ALL type safety.
  // - If the interface changes, this test won't warn you.
  // - It's a code smell and should be forbidden by linters anyway.

  // @ts-ignore
  const mockDependency: IExtensiveDependency = {
    methodUsedInTest: jest.fn().mockReturnValue("test result"),
  };

  const service = new MyService(mockDependency);
  const result = service.processData("input data");

  expect(result).toBe("test result processed");
});

// --- Jest (Option 3: as unknown as IExtensiveDependency - Unsafe Cast) ---
test("processData - Jest (Unsafe Cast)", () => {
  const mockDependency = {
    methodUsedInTest: jest.fn().mockReturnValue("test result"),
  } as unknown as IExtensiveDependency; // UNSAFE CAST: if methodUsedInTest name or signature changes, the TypeScript compiler will not warn you.
  // => you will find that in CI, and waste time debugging.

  const service = new MyService(mockDependency);
  const result = service.processData("input data");

  expect(result).toBe("test result processed");
});

// --- Mockit (Stubs by Default - Clean and Safe) ---

test("processData - Mockit", () => {
  // Just mock the interface.  All methods are stubbed automatically on first use.
  const mockDependency = m.Mock<IExtensiveDependency>();

  // Only define the behavior you need:
  m.when(mockDependency.methodUsedInTest).isCalled.thenReturn("test result");

  const service = new MyService(mockDependency);
  const result = service.processData("input data");

  m.expect(result).toEqual("test result processed");
});

// With mockit:
// - You don't need to provide implementations for all methods.
// - You don't need to use @ts-ignore or unsafe casts.
// - The TypeScript compiler will if you try to access a method that is not in the interface.
// - The TypeScript compiler will help you with auto-completion.
