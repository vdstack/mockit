import { ProxyFactory } from "./matcher-proxy-factory";
import { NoInfer } from "./matchers";

export const containingDeep = <T, U>(mock: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isContainingDeep", { ...mock, original: mock });
};
