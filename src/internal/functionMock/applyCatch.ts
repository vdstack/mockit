import { Behaviour, NewBehaviourParam } from "./behaviour";

import { MockGetters, MockSetters } from "./accessors";

export function applyCatch(target, _thisArg, argumentsList) {
  // Checking if there is a custom behaviour for this call
  const mockMap = MockGetters(target).mockMap;

  const behaviourWithTheseArguments = mockMap.get(argumentsList) as {
    calls: any[];
    customBehaviour: NewBehaviourParam;
  };

  let behaviour = behaviourWithTheseArguments?.customBehaviour;

  // Default behaviour
  if (!behaviour) {
    behaviour = MockGetters(target).defaultBehaviour;
  }

  // Adding the call to the list of calls, for the spy
  const calls = MockGetters(target).calls;
  calls.push({
    args: argumentsList,
    behaviour,
  });

  const callsMap = MockGetters(target).callsMap;
  callsMap.registerCall(argumentsList, behaviour);

  MockSetters(target).callsMap = callsMap;
  MockSetters(target).calls = calls;

  switch (behaviour.behaviour) {
    case Behaviour.Return:
      return behaviour.returnedValue;
    case Behaviour.Throw:
      throw behaviour.error;
    case Behaviour.Call:
      return behaviour.callback(...argumentsList);
    case Behaviour.Resolve:
      return Promise.resolve(behaviour.resolvedValue);
    case Behaviour.Reject:
      return Promise.reject(behaviour.rejectedValue);
    default:
      throw new Error("Mock logic not implemented yet");
  }
}
