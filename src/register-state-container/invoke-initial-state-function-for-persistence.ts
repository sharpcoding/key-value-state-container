import _ from "lodash";

import { Action } from "../types/contracts/action";
import { PersistenceEnvelope } from "../types/persistence-envelope";
import { RegisterStateContainerArgs } from "../types/contracts/register-state-container";

interface Args<TState extends Object, TAction extends Action>
  extends Required<
    Pick<RegisterStateContainerArgs<TState, TAction>, "persistence">
  > {
  envelope: PersistenceEnvelope | undefined;
  initialState: (persistedState: Partial<TState>) => TState;
}

const getPayload = <TState extends Object, TAction extends Action>({
  envelope,
  persistence,
}: Pick<
  Args<TState, TAction>,
  "envelope" | "persistence"
>): Partial<TState> => {
  if (
    envelope &&
    envelope.version !== persistence.version &&
    _.isFunction(persistence.converter)
  ) {
    const converted = persistence.converter({
      persistedState: envelope.contents,
      version: envelope.version,
    });
    return converted;
  }
  return envelope?.contents || {};
};

export const invokeInitialStateFunctionForPersistence = <
  TState extends Object,
  TAction extends Action
>({
  envelope,
  initialState,
  persistence,
}: Args<TState, TAction>): TState => {
  const result = initialState(getPayload({ envelope, persistence }));
  return result;
};
