export function ProxyFactory<T>(suffix: string, content: Record<string, any>) {
  return new Proxy(
    {
      [`mockit__${suffix}`]: true,
      ...content,
    },
    {
      get(target, prop) {
        // @ts-expect-error - I don't know how to fix this yet
        if (target === "mockitSuffix") {
          return () => suffix;
        }

        // @ts-expect-error - I don't know how to fix this yet
        return target[prop];
      },
    }
  ) as any as T;
}
