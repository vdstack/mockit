import { HashingMap } from "../../utils/HashingMap";
import { MockGetters, MockSetters } from "./accessors";
import { NewBehaviourParam } from "./behaviour";

export function setCatch(target, prop, newValue, receiver) {
  const Setters = MockSetters(target);
  if (prop === "init") {
    Setters.defaultBehaviour = newValue.defaultBehaviour;
    Setters.functionName = newValue.functionName;
    Setters.mockMap = newValue.mockMap;
    Setters.callsMap = newValue.callsMap;
    Setters.suppositionsRegistry = newValue.suppositionsRegistry;
    Setters.calls = [];

    return true;
  }

  // this will list authorized properties
  switch (prop) {
    case "defaultBehaviour": {
      Setters.defaultBehaviour = newValue;
      break;
    }
    case "calls": {
      Setters.calls = newValue;
      break;
    }
    case "callsMap": {
      Setters.callsMap = newValue;
      break;
    }
    case "functionName": {
      Setters.functionName = newValue;
      break;
    }
    case "newCustomBehaviour": {
      const { args, customBehaviour } = newValue as {
        args: any[];
        customBehaviour: NewBehaviourParam;
      };

      const mockMap: HashingMap = MockGetters(target).mockMap;
      const existingCustomBehaviour = mockMap.get(args) as {
        calls: any[];
        customBehaviour: NewBehaviourParam;
      };
      mockMap.set(args, {
        customBehaviour,
        calls: existingCustomBehaviour?.calls ?? [],
        // This is important to keep track of calls in case of multiple behaviours
      });
      break;
    }
    default:
      throw new Error("Unauthorized property");
  }

  return;
}
