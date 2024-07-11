import { ProxyFactory } from "./matcher-proxy-factory";
import { NoInfer } from "./matchers";

export const containing = <T, U extends any>(original: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isContaining", { original });
};
