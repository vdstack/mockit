import { MockGetters } from "./accessors";

export function getCatch(target, prop, _receiver) {
  switch (prop) {
    case "defaultBehaviour":
      return MockGetters(target).defaultBehaviour;
    case "calls":
      return MockGetters(target).calls;
    case "functionName":
      return MockGetters(target).functionName;
    case "mockMap":
      return MockGetters(target).mockMap;
    case "callsMap":
      return MockGetters(target).callsMap;
    case "suppositionsMap":
      return MockGetters(target).suppositionsRegistry;
    default:
      throw new Error("Unauthorized property");
  }
}
