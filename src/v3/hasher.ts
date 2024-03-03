import hash from "node-object-hash";

export const hasher = hash({ coerce: { set: true, symbol: true } });
